const { CHECKS } = require("../../helper/collection-name");
const getdb = require("../../database/db").getDb;
const { ObjectId } = require("mongodb");
const moment = require("moment");

module.exports = {
  async getTransactionReport(requestDetails) {
    const { saleClosedDate, store_id, paymentType, paymentName, transactionDate } = requestDetails.query;

    const closedDate = dateQuery(saleClosedDate);
    const transactionDateFilter = dateQuery(transactionDate);

    try {
      const pipeline = [
        {
          $match: {
            store_id: ObjectId(store_id),
            status: "closed",
            ...(closedDate && { closedDate }),
          }
        },
        {
          $unwind: "$payments" // Unwind the payments array
        },
        {
          $match: {
            ...(paymentType && { "payments.paymentType": paymentType }),
            ...(paymentName && { "payments.paymentName": paymentName }),
            ...(transactionDateFilter && { "payments.transactionDate": transactionDateFilter })
          }
        },
        {
          $project: {
            _id: 0,
            payments: {
              $mergeObjects: [
                "$payments",
                {
                  checkNo: "$checkNo",
                  checkId: "$id"
                }
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            payments: { $push: "$payments" },
          }
        }
      ];

      const [result] = await getdb(CHECKS).aggregate(pipeline).toArray();

      return {
        success: true,
        result: {
          payments: result ? result.payments : [],
        },
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};

// Helper function for date range based on dateFilter
function dateQuery(dateFilter) {
  let startDate, endDate;
  if (!dateFilter) {
    return null; // Handle case when dateFilter is empty or not provided
  }
  switch (dateFilter) {
    case "T": // Today
      startDate = moment().startOf("day").toISOString();
      endDate = moment().endOf("day").toISOString();
      break;
    case "Y": // Yesterday
      startDate = moment().subtract(1, "day").startOf("day").toISOString();
      endDate = moment().subtract(1, "day").endOf("day").toISOString();
      break;
    case "LSW": // Last Week
      startDate = moment().subtract(1, "week").startOf("week").toISOString();
      endDate = moment().startOf("week").toISOString();
      break;
    case "W": // This Week
      startDate = moment().startOf("week").toISOString();
      endDate = moment().endOf("week").toISOString();
      break;
    case "L7D": // Last Seven Days
      startDate = moment().subtract(7, "days").startOf("day").toISOString();
      endDate = moment().endOf("day").toISOString();
      break;
    default:
      return null; // Handle invalid dateFilter
  }
  return { $gte: startDate, $lt: endDate };
}
