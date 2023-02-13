namespace MeroHisab.Core.Dto.Report
{
    public class ReportTransactionDetailDto : TransactionDetailDto
    {
        public string LedgerName { get; set; }
        public string LedgerCode { get; set; }
        public string RefLedgerName { get; set; }
        public string RefLedgerCode { get; set; }

        public decimal Balance { get; set; }
    }
}
