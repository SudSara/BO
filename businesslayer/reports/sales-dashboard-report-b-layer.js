const { CHECKS } = require("../../helper/collection-name");
const getdb = require("../../database/db").getDb;
const { ObjectId } = require("mongodb");
const moment = require("moment");
const { hourLabels } = require("../../helper/constants");

module.exports = {
  async getSaleReport(requestDetails) {
    const { dateFilter, store_id } = requestDetails.query;

    try {
      const filter = dateQuery(dateFilter);
      const pipeline = [
        { $match: { store_id: ObjectId(store_id), created_at: filter } },
        {
          $facet: {
            salesReport: [{ $group: groupFields() }],
            hourlySales: [
              { $addFields: { hour: { $hour: "$created_at" } } },
              {
                $group: { _id: "$hour", totalAmount: { $sum: "$paidAmount" } },
              },
              { $sort: { _id: 1 } },
            ],
            tenderSales: [
              { $unwind: "$payments" },
              {
                $group: {
                  _id: "$payments.paymentType",
                  totalAmount: { $sum: "$payments.authorizedAmount" },
                },
              },
              { $project: { _id: 0, name: "$_id", amount: "$totalAmount" } },
              { $sort: { name: 1 } },
            ],
          },
        },
      ];

      const [result] = await getdb(CHECKS).aggregate(pipeline).toArray();
      const { hourlySales, tenderSales, salesReport } = result;

      const salesReportData =
        salesReport.length > 0
          ? salesReport[0]
          : {
              tax: 0,
              discount: 0,
              paid: 0,
              gross: 0,
              netSale: 0,
            };

      const hourlySalesData = {
        data: {},
        label: [...hourLabels],
      };

      hourLabels.forEach((label) => {
        hourlySalesData.data[label] = { name: label, amount: 0 };
      });

      hourlySales.forEach((result) => {
        const hourStr =
          hourLabels[result._id] || `${result._id}:00 - ${result._id + 1}:00`;
        if (hourlySalesData.data[hourStr]) {
          hourlySalesData.data[hourStr].amount = result.totalAmount;
        }
      });

      const saleByTender = tenderSales.reduce((acc, result) => {
        acc[result.name] = { name: result.name, amount: result.amount };
        return acc;
      }, {});

      return {
        success: true,
        result: {
          salesReport: {
            tax: salesReportData.tax,
            discount: salesReportData.discount,
            paid: salesReportData.paid,
            gross: salesReportData.gross,
            netSale: salesReportData.netSale,
          },
          hourlySales: hourlySalesData,
          saleByTender: saleByTender,
        },
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};

function groupFields() {
  return {
    _id: null,
    tax: { $sum: "$tax" },
    discount: { $sum: "$discount" },
    paid: { $sum: "$paidAmount" },
    gross: { $sum: "$total" },
    netSale: { $sum: "$subTotal" },
  };
}

function dateQuery(dateFilter) {
  let startDate, endDate;
  switch (dateFilter) {
    case "T": // Today
      startDate = moment().startOf("day").toDate();
      endDate = moment().endOf("day").toDate();
      break;
    case "Y": // Yesterday
      startDate = moment().subtract(1, "day").startOf("day").toDate();
      endDate = moment().subtract(1, "day").endOf("day").toDate();
      break;
    case "LSW": // Last Week
      startDate = moment().subtract(1, "week").startOf("week").toDate();
      endDate = moment().startOf("week").toDate();
      break;
    case "W": // This Week
      startDate = moment().startOf("week").toDate();
      endDate = moment().endOf("week").toDate();
      break;
    case "L7D": // Last Seven Days
      startDate = moment().subtract(7, "days").startOf("day").toDate();
      endDate = moment().startOf("day").toDate();
      break;
    default:
      throw new Error("Invalid date filter");
  }
  return { $gte: startDate, $lt: endDate };
}
