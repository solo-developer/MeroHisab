namespace MeroHisab.Core.Dto.Report
{
    public class ReceiptDto
    {
        public int Id { get; set; }
        public string From { get; set; }
        public string To { get; set; }
        public decimal Amount { get; set; }
        public decimal DiscountAllowed { get; set; }
        public DateTime TransactionDate { get; set; }

        public string Remarks { get; set; }
    }
}
