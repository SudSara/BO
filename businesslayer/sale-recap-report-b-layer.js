const { CHECKS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {
    async generateSalesRecapReport(params) {
        try {
            const pipeline = createAggregationPipeline(params);
            const [result] = await getdb(CHECKS).aggregate(pipeline).toArray();
            return {
                success: true,
                result: formatReportResults(result)
            };
        } catch (err) {
            console.error("Error generating sales recap report:", err);
            return { success: false, message: 'Error generating report', error: err.message };
        }
    }
};

function buildFilter(params) {
    const filter = { status: 'closed' };

    if (params.store_id) {
        filter.store_id = ObjectId(params.store_id);
    }

    if (params.employees && params.employees.length > 0) {
        filter.openEmployee = { $in: params.employees.map(empId => empId) };
    }

    return filter;
}

function createAggregationPipeline(params) {
    return [
        { $match: buildFilter(params) },
        { $project: {
            payments: 1,
            seats: 1
        }},
        { $facet: {
            salesRecap: [{ $group: groupFields() }],
            paymentSummary: paymentSummaryPipeline(),
            taxSummary: taxSummaryPipeline(),
            discountSummary: discountSummaryPipeline()
        }}
    ];
}

function groupFields() {
    return {
        _id: null,
        sale: { $sum: '$total' },
        tax: { $sum: '$tax' },
        discount: { $sum: '$discount' },
        paid: { $sum: '$paidAmount' }
    };
}

function paymentSummaryPipeline() {
    return [
        { $unwind: '$payments' },
        { $group: {
            _id: '$payments.paymentType',
            totalAuthorizedAmount: { $sum: '$payments.authorizedAmount' }
        }},
        { $project: {
            _id: 0,
            paymentType: '$_id',
            totalAuthorizedAmount: 1
        }}
    ];
}

function taxSummaryPipeline() {
    return [
        { $unwind: '$seats' },
        { $unwind: '$seats.orders' },
        { $unwind: '$seats.orders.allTaxes' },
        { $group: {
            _id: '$seats.orders.allTaxes.name',
            totalAmount: { $sum: '$seats.orders.allTaxes.amount' }
        }},
        { $project: {
            _id: 0,
            taxName: '$_id',
            totalAmount: 1
        }}
    ];
}

function discountSummaryPipeline() {
    return [
        { $unwind: '$seats' },
        { $unwind: '$seats.orders' },
        { $unwind: '$seats.orders.discounts' },
        { $group: {
            _id: '$seats.orders.discounts.discount.name',
            totalAmount: { $sum: '$seats.orders.discounts.amount' }
        }},
        { $project: {
            _id: 0,
            discountName: '$_id',
            totalAmount: 1
        }}
    ];
}

function formatReportResults(result) {
    const salesRecapReport = formatSalesRecap(result.salesRecap);
    const paymentSummary = formatPaymentSummary(result.paymentSummary);
    const taxSummary = formatTaxSummary(result.taxSummary);
    const discountSummary = formatDiscountSummary(result.discountSummary);

    return {
        paymentSummary,
        taxSummary,
        discountSummary,
        ...salesRecapReport
    };
}

function formatSalesRecap(data) {
    if (data.length === 0) {
        return { sale: 0, tax: 0, discount: 0, paid: 0 };
    }
    const { sale, tax, discount, paid } = data[0];
    return { sale, tax, discount, paid };
}

function formatPaymentSummary(paymentData) {
    return paymentData.reduce((summary, item) => {
        summary[item.paymentType] = item.totalAuthorizedAmount;
        return summary;
    }, {});
}

function formatTaxSummary(taxData) {
    return taxData.reduce((summary, item) => {
        summary[item.taxName] = item.totalAmount;
        return summary;
    }, {});
}

function formatDiscountSummary(discountsArray) {
    return discountsArray.reduce((summary, item) => {
        summary[item.discountName] = (summary[item.discountName] || 0) + item.totalAmount;
        return summary;
    }, {});
}
