const { CHECKS } = require("../../helper/collection-name");
const getdb = require("../../database/db").getDb;
const { ObjectId } = require("mongodb");
const moment = require("moment");

module.exports = {
  async getTransactionReport(requestDetails) {
    const { dateFilter, store_id, paymentType, paymentName, transactionDate } = requestDetails.query;

    // Validate and get the date range
    const closedDate = dateQuery(dateFilter);
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
        { $unwind: "$payments" }, // Unwind the payments array
        {
          $match: {
            ...(paymentType && { "payments.paymentType": paymentType }), // Optional filter for paymentType
            ...(paymentName && { "payments.paymentName": paymentName }), // Optional filter for paymentName
            ...(transactionDateFilter && {
              "payments.transactionDate": {
                $gte: transactionDateFilter.startDate,
                $lt: transactionDateFilter.endDate,
              }
            }), // Optional filter for transactionDate
          },
        },
        {
          $group: {
            _id: null, // No need for specific grouping, using `null`
            payments: { $push: "$payments" }, // Collect all matching payments into an array
          },
        },
      ];

      const [result] = await getdb(CHECKS).aggregate(pipeline).toArray();

      return {
        success: true,
        result: {
          payments: result ? result.payments : [], // Return payments if found, else return an empty array
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
  return { startDate, endDate };
}
