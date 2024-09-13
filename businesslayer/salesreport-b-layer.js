const { CHECKS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');
const moment = require('moment');
const { hourLabels } = require('../helper/constants');

module.exports = {
    async getSaleReport(requestDetails) {
        const { dateFilter, store_id } = requestDetails.query;

        try {
            const filter = dateQuery(dateFilter);

            const pipeline = [
                { $match: { store_id: ObjectId(store_id), created_at: filter } },
                { $facet: {
                    hourlySales: [
                        { $addFields: { hour: { $hour: "$created_at" } } },
                        { $group: { _id: "$hour", totalAmount: { $sum: "$paidAmount" } } },
                        { $sort: { "_id": 1 } }
                    ],
                    tenderSales: [
                        { $unwind: "$payments" },
                        { $group: { _id: "$payments.paymentType", totalAmount: { $sum: "$payments.authorizedAmount" } } },
                        { $project: { _id: 0, name: "$_id", amount: "$totalAmount" } },
                        { $sort: { name: 1 } }
                    ]
                }}
            ];

            const [result] = await getdb(CHECKS).aggregate(pipeline).toArray();
            const { hourlySales, tenderSales } = result;


            const hourlySalesData = {
                data: {},
                label: []
            };

            hourLabels.forEach((label, index) => {
                hourlySalesData.data[label] = { name: label, amount: 0 };
                hourlySalesData.label.push(label);
            });

            hourlySales.forEach(result => {
                const hourStr = hourLabels[result._id] || `${result._id}:00 - ${result._id + 1}:00`;
                hourlySalesData.data[hourStr].amount = result.totalAmount;
            });

            hourlySalesData.label.sort((a, b) => {
                const aIndex = hourLabels.indexOf(a.split(' ')[0]);
                const bIndex = hourLabels.indexOf(b.split(' ')[0]);
                return aIndex - bIndex;
            });

            const saleByTender = tenderSales.reduce((acc, result) => {
                acc[result.name] = { name: result.name, amount: result.amount };
                return acc;
            }, {});

            return {
                success: true,
                result: {
                    salesReport: hourlySalesData,
                    saleByTender: saleByTender
                }
            };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },
    async getCategoryReport(requestDetails) {
        const { dateFilter, store_id } = requestDetails.query;
        try {
            const filter = dateQuery(dateFilter);
            const storeObjectId = new ObjectId(store_id);
            const categoryPipeline = [
                {
                    $match: {
                        store_id: storeObjectId,
                        created_at: filter
                    }
                },
                {
                    $unwind: "$seats"
                },
                {
                    $unwind: "$seats.orders"
                },
                {
                    $group: {
                        _id: "$seats.orders.category",
                        totalAmount: { $sum: "$seats.orders.total" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: "$_id",
                        amount: "$totalAmount"
                    }
                }
            ];
    
            const categoryResults = await getdb(CHECKS).aggregate(categoryPipeline).toArray();
            const categorySales = categoryResults.reduce((acc, result) => {
                if (result.name) {
                    acc[result.name] = {
                        name: result.name,
                        amount: result.amount
                    };
                }
                return acc;
            }, {});
    
            return {
                success: true,
                result: {
                    categorySales
                }
            };
    
        } catch (err) {
            return { success: false, error: `Error generating report: ${err.message}` };
        }
    }
    
};




function dateQuery(dateFilter) {
    let startDate, endDate;
    switch (dateFilter) {
        case 'T': // Today
            startDate = moment().startOf('day').toDate();
            endDate = moment().endOf('day').toDate();
            break;
        case 'Y': // Yesterday
            startDate = moment().subtract(1, 'day').startOf('day').toDate();
            endDate = moment().subtract(1, 'day').endOf('day').toDate();
            break;
        case 'LSW': // Last Week
            startDate = moment().subtract(1, 'week').startOf('week').toDate();
            endDate = moment().startOf('week').toDate();
            break;
        case 'W': // This Week
            startDate = moment().startOf('week').toDate();
            endDate = moment().endOf('week').toDate();
            break;
        case 'L7D': // Last Seven Days
            startDate = moment().subtract(7, 'days').startOf('day').toDate();
            endDate = moment().startOf('day').toDate();
            break;
        default:
            throw new Error('Invalid date filter');
    }
    return { $gte: startDate, $lt: endDate };
}
