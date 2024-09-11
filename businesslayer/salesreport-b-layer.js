const { CHECKS } = require('../helper/collection-name');
const getdb = require('../database/db').getDb;
const { ObjectId } = require('mongodb');
const moment = require('moment');
const { hourLabels,currencyFormats } = require('../helper/constants');
module.exports = {
    async getSaleReport(requestDetails) {
        let { dateFilter, store_id } = requestDetails.query
        try {
            const filter = dateQuery(dateFilter)
            const hourlyPipeline = [
                {
                    $match: {
                        store_id: ObjectId(store_id),
                        created_at: filter
                    }
                },
                {
                    $addFields: {
                        business_date: {
                            $dateFromString: {
                                dateString: "$business_date",
                                format: "%d-%m-%Y"
                            }
                        }
                    }
                },
                {
                    $project: {
                        hour: { $hour: "$business_date" },
                        total: "$total"
                    }
                },
                {
                    $group: {
                        _id: "$hour",
                        totalAmount: { $sum: "$total" }
                    }
                },
                {
                    $sort: { "_id": 1 } // Sort by hour
                }
            ];

            // Aggregation pipeline for sales by tender
            const tenderPipeline = [
                {
                    $match: {
                        store_id: ObjectId(store_id),
                        created_at: filter
                    }
                },
                {
                    $unwind: "$payments"
                },
                {
                    $group: {
                        _id: "$payments.paymentType",
                        totalAmount: { $sum: "$payments.authorizedAmount" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: "$_id",
                        amount: "$totalAmount",
                        amountStr: {
                            $concat: [currencyFormats.rupee, { $toString: "$totalAmount" }]
                        }
                    }
                },
                {
                    $sort: { name: 1 } // Sort by payment type
                }
            ];

            
            // Assuming `getdb` returns a MongoDB collection
            const [hourlyResults, tenderResults] = await Promise.all([
            getdb(CHECKS).aggregate(hourlyPipeline).toArray(),
            getdb(CHECKS).aggregate(tenderPipeline).toArray()
        ]);
            
            const hourlySales = {
                data: {},
                label: []
            };

            hourlyResults.forEach(result => {
                const hour = result._id;
                const hourStr = hourLabels[hour];
                const amount = result.totalAmount;
                hourlySales.data[hourStr] = {
                    name: hourStr,
                    amount: amount,
                    amountStr: currencyFormats.rupee+`${amount}`
                };
                hourlySales.label.push(hourStr);
            });

            // Format sale by tender results
            const saleByTender = {};

            tenderResults.forEach(result => {
                saleByTender[result.name] = {
                    name: result.name,
                    amount: result.amount,
                    amountStr: result.amountStr
                };
            });
    
            // Ensure labels are sorted correctly
            hourlySales.label.sort((a, b) => hourLabels.indexOf(a) - hourLabels.indexOf(b));
            return {
                success: true,
                result: {
                    salesReport: hourlySales,
                    saleByTender: saleByTender
                }
            };
        } catch (err) {
            return { success: false, error: err.message };
        }
    },
    async getCategoryReport(requestDetails) {
        let { dateFilter, store_id } = requestDetails.query
        try {
            const filter = dateQuery(dateFilter)
            
            const categoryPipeline = [
                {
                    $match: {
                        store_id: ObjectId(store_id),
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
                        totalAmount: { $sum: "$seats.orders.price" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: "$_id",
                        amount: "$totalAmount",
                        amountStr: {
                            $concat: [currencyFormats.rupee, { $toString: "$totalAmount" }]
                        }
                    }
                }
            ];
            
            // Execute the aggregation pipeline
            const categoryResults = await getdb(CHECKS).aggregate(categoryPipeline).toArray();
    
            // Format the result
            const categorySales = {};
            categoryResults.forEach(result => {
                if(result.name){
                    categorySales[result.name] = {
                        name: result.name,
                        amount: result.amount,
                        amountStr: result.amountStr
                    };
                }
            });
    
            return {
                success: true,
                result: {
                    categorySales: categorySales
                }
            };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
}


function dateQuery(dateFilter){
    let dateRange = {};
    switch (dateFilter) {
        case 'T': // Today
            dateRange = {
                $gte: moment().startOf('day').toDate(),
                $lt: moment().endOf('day').toDate()
            };
            break;
        case 'Y': // Yesterday
            dateRange = {
                $gte: moment().subtract(1, 'day').startOf('day').toDate(),
                $lt: moment().subtract(1, 'day').endOf('day').toDate()
            };
            break;
        case 'LSW': // Last Week
            dateRange = {
                $gte: moment().subtract(1, 'week').startOf('week').toDate(),
                $lt: moment().startOf('week').toDate()
            };
            break;
        case 'W': // This Week
            dateRange = {
                $gte: moment().startOf('week').toDate(),
                $lt: moment().endOf('week').toDate()
            };
            break;
        case 'L7D': // Last Seven Days
            dateRange = {
                $gte: moment().subtract(7, 'days').startOf('day').toDate(),
                $lt: moment().startOf('day').toDate()
            };
            break;
        default:
            throw new Error('Invalid date filter');
    }
    return dateRange;
}