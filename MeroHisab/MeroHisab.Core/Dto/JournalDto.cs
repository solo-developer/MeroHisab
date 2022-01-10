namespace MeroHisab.Core.Dto
{
    public class JournalDto
    {
        public DateTime TransactionDate { get; set; }

        public string Remarks { get; set; }

        public int VoucherNo { get; set; }

        public List<JournalDetailDto> Details { get; set; }=new List<JournalDetailDto>();

    }

    public class JournalDetailDto
    {
        public int LedgerId { get; set; }
        public decimal DrAmount { get; set; }
        public decimal CrAmount { get; set; }
        
    }
}
