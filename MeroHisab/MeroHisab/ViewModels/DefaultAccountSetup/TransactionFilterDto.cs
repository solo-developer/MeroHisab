using System;

namespace MeroHisab.ViewModels.DefaultAccountSetup
{
    public class TransactionFilterViewModel
    {
        public DateTime FromDate { get; set; } = DateTime.Now.AddDays(-7);
        public DateTime ToDate { get; set; } = DateTime.Now;
        public int? LedgerId { get; set; }
    }
}
