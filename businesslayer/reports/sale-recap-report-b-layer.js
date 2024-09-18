const { CHECKS } = require("../../helper/collection-name");
const getdb = require("../../database/db").getDb;
const { ObjectId } = require("mongodb");
const tillsBLayer = require("../tills-b-layer");

module.exports = {
  async generateSalesRecapReport(params) {
    try {
      const pipeline = createAggregationPipeline(params);
      const tillPipeLine = createAggregationPipelineForTill(params);
      const [result] = await getdb(CHECKS).aggregate(pipeline).toArray();
      const tillsSummary = await tillsBLayer.getTillsForSaleRecap(tillPipeLine);
      const reportResult = await Promise.all([
        formatSalesRecap(result.salesRecap),
        formatPaymentSummary(result.paymentSummary),
        formatDiscountSummary(result.discountSummary),
        formatTaxSummary(result),
      ]);

      return {
        success: true,
        result: Object.assign({}, ...reportResult, {
          tillSummary: formTillSummary(tillsSummary.result),
        }),
      };
    } catch (err) {
      return { success: false, message: "Not Found", error: err?.message };
    }
  },
};
function buildFilter(params) {
  const filter = { status: "closed" };

  if (params.store_id) filter.store_id = ObjectId(params.store_id);
  if (params.businessDate) filter.businessDate = params.businessDate;
  if (params.employees?.length) {
    filter.openEmployee = { $in: params.employees };
  }

  return filter;
}

function buildFilterForTills(params) {
  const filter = {};
  if (params.store_id) filter.store_id = ObjectId(params.store_id);
  if (params.businessDate) filter.startDate = params.businessDate;
  if (params.employees?.length) {
    filter.openBy = { $in: params.employees };
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
        checkTaxSummary: checkTaxSummaryPipeline(),
      },
    },
  ];
}

function createAggregationPipelineForTill(params) {
  const filter = buildFilterForTills(params);

  return [
    { $match: filter },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        totalOpenBalance: { $sum: "$openBalance" },
        totalClosedBalance: { $sum: "$closedBalance" },
        totalCashDrop: { $sum: "$cashDrop" },
        totalPaidIn: { $sum: "$paidIn" },
        totalPaidOut: { $sum: "$paidOut" },
        totalCashRefund: { $sum: "$cashRefund" },
        totalTipPaid: { $sum: "$tipPaid" },
      },
    },
    {
      $project: {
        _id: 0, // Exclude _id field from the result
        amount: "$totalAmount",
        openBalance: "$totalOpenBalance",
        closedBalance: "$totalClosedBalance",
        cashDrop: "$totalCashDrop",
        paidIn: "$totalPaidIn",
        paidOut: "$totalPaidOut",
        cashRefund: "$totalCashRefund",
        tipPaid: "$totalTipPaid",
      },
    },
  ];
}

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

function paymentSummaryPipeline() {
  return [
    { $unwind: "$payments" },
    {
      $group: {
        _id: "$payments.type",
        totalAuthorizedAmount: { $sum: "$payments.amount" },
      },
    },
    {
      $project: {
        _id: 0,
        paymentType: "$_id",
        totalAuthorizedAmount: 1,
      },
    },
  ];
}

function checkTaxSummaryPipeline() {
  return [
    { $unwind: "$taxes" },
    {
      $group: {
        _id: "$taxes.name",
        totalAuthorizedAmount: { $sum: "$taxes.amount" },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        totalAuthorizedAmount: 1,
      },
    },
  ];
}

function taxSummaryPipeline() {
  return [
    { $unwind: "$seats" },
    { $unwind: "$seats.orders" },
    { $unwind: "$seats.orders.allTaxes" },
    {
      $group: {
        _id: "$seats.orders.allTaxes.name",
        totalAmount: { $sum: "$seats.orders.allTaxes.amount" },
      },
    },
    {
      $project: {
        _id: 0,
        taxName: "$_id",
        totalAmount: 1,
      },
    },
  ];
}

function discountSummaryPipeline() {
  return [
    { $unwind: "$seats" },
    { $unwind: "$seats.orders" },
    { $unwind: "$seats.orders.discounts" },
    {
      $group: {
        _id: "$seats.orders.discounts.discount.name",
        totalAmount: { $sum: "$seats.orders.discounts.amount" },
      },
    },
    {
      $project: {
        _id: 0,
        discountName: "$_id",
        totalAmount: 1,
      },
    },
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

function formTillSummary(data) {
  const result = (data && data[0]) || {};
  return {
    amount: result?.amount || 0,
    openBalance: result?.openBalance || 0,
    closedBalance: result?.closedBalance || 0,
    cashDrop: result?.cashDrop || 0,
    paidIn: result?.paidIn || 0,
    paidOut: result?.paidOut || 0,
    cashRefund: result?.cashRefund || 0,
    tipPaid: result?.tipPaid || 0,
  };
}

async function formatPaymentSummary(paymentData) {
  return {
    paymentSummary: paymentData.reduce((summary, item) => {
      summary[item.paymentType] = item.totalAuthorizedAmount;
      return summary;
    }, {}),
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
    taxSummary: { ...taxSummary, ...checkTaxSummary },
  };
}

async function formatDiscountSummary(discountsArray) {
  return {
    discountSummary: discountsArray.reduce((summary, item) => {
      summary[item.discountName] =
        (summary[item.discountName] || 0) + item.totalAmount;
      return summary;
    }, {}),
  };
}
