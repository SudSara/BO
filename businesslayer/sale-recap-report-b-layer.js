const { CHECKS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');

module.exports = {
    async generateSalesRecapReport(params) {
        try {
            const pipeline = createAggregationPipeline(params);
            const [result] = await getdb(CHECKS).aggregate(pipeline).toArray();

            const reportResult = await Promise.all([
                formatSalesRecap(result.salesRecap),
                formatPaymentSummary(result.paymentSummary),
                formatDiscountSummary(result.discountSummary),
                formatTaxSummary(result),
            ]);

            return {
                success: true,
                result: Object.assign({}, ...reportResult)
            };
        } catch (err) {
            return { success: false, message: 'Not Found', error: err?.message };
        }
    }
};

function buildFilter(params) {
    const filter = { status: 'closed' };

    if (params.store_id) filter.store_id = ObjectId(params.store_id);
    if (params.businessDate) filter.businessDate = params.businessDate;
    if (params.employees?.length) {
        filter.openEmployee = { $in: params.employees };
    }

    return filter;
}

function createAggregationPipeline(params) {
    const filter = buildFilter(params);

    return [
        { $match: filter },
        {
            $facet: {
                salesRecap: [{ $group: groupFields() }],
                paymentSummary: paymentSummaryPipeline(),
                taxSummary: taxSummaryPipeline(),
                discountSummary: discountSummaryPipeline(),
                checkTaxSummary: checkTaxSummaryPipeline()
            }
        }
    ];
}

function groupFields() {
    return {
        _id: null,
        tax: { $sum: '$tax' },
        discount: { $sum: '$discount' },
        paid: { $sum: '$paidAmount' },
        gross: { $sum: '$total' },
        netSale: { $sum: '$subTotal' }
    };
}

function paymentSummaryPipeline() {
    return [
        { $unwind: '$payments' },
        {
            $group: {
                _id: '$payments.paymentType',
                totalAuthorizedAmount: { $sum: '$payments.authorizedAmount' }
            }
        },
        {
            $project: {
                _id: 0,
                paymentType: '$_id',
                totalAuthorizedAmount: 1
            }
        }
    ];
}

function checkTaxSummaryPipeline() {
    return [
        { $unwind: '$taxes' },
        {
            $group: {
                _id: '$taxes.name',
                totalAuthorizedAmount: { $sum: '$taxes.amount' }
            }
        },
        {
            $project: {
                _id: 0,
                name: '$_id',
                totalAuthorizedAmount: 1
            }
        }
    ];
}

function taxSummaryPipeline() {
    return [
        { $unwind: '$seats' },
        { $unwind: '$seats.orders' },
        { $unwind: '$seats.orders.allTaxes' },
        {
            $group: {
                _id: '$seats.orders.allTaxes.name',
                totalAmount: { $sum: '$seats.orders.allTaxes.amount' }
            }
        },
        {
            $project: {
                _id: 0,
                taxName: '$_id',
                totalAmount: 1
            }
        }
    ];
}

function discountSummaryPipeline() {
    return [
        { $unwind: '$seats' },
        { $unwind: '$seats.orders' },
        { $unwind: '$seats.orders.discounts' },
        {
            $group: {
                _id: '$seats.orders.discounts.discount.name',
                totalAmount: { $sum: '$seats.orders.discounts.amount' }
            }
        },
        {
            $project: {
                _id: 0,
                discountName: '$_id',
                totalAmount: 1
            }
        }
    ];
}

// Formatting the report results
async function formatSalesRecap(data) {
    const result = data[0] || {};
    return {
        tax: result.tax || 0,
        discount: result.discount || 0,
        paid: result.paid || 0,
        gross: result.gross || 0,
        netSale: result.netSale || 0,
    };
}

async function formatPaymentSummary(paymentData) {
    return {
        paymentSummary: paymentData.reduce((summary, item) => {
            summary[item.paymentType] = item.totalAuthorizedAmount;
            return summary;
        }, {})
    };
}

async function formatTaxSummary(data) {
    const taxSummary = data.taxSummary.reduce((summary, item) => {
        summary[item.taxName] = item.totalAmount;
        return summary;
    }, {});

    const checkTaxSummary = data.checkTaxSummary.reduce((summary, item) => {
        summary[item.name] = item.totalAuthorizedAmount;
        return summary;
    }, {});

    return {
        taxSummary: { ...taxSummary, ...checkTaxSummary }
    };
}

async function formatDiscountSummary(discountsArray) {
    return {
        discountSummary: discountsArray.reduce((summary, item) => {
            summary[item.discountName] = (summary[item.discountName] || 0) + item.totalAmount;
            return summary;
        }, {})
    };
}
