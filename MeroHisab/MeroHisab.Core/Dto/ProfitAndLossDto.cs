namespace MeroHisab.Core.Dto
{
    public class ProfitAndLossDto
    {
        private List<LedgerAmountDto> _incomeLedgerBalanceDtos { get; set; } = new List<LedgerAmountDto>();
        private List<LedgerAmountDto> _expenseLedgerBalanceDtos { get; set; } = new List<LedgerAmountDto>();

        public decimal OpeningBalance { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }

        public void AddIncomeLedgerAmountDto(List<LedgerAmountDto> incomeLedgerAmountDto)
        {
            _incomeLedgerBalanceDtos.AddRange(incomeLedgerAmountDto);
        }

        public void AddExpensesLedgerAmountDto(List<LedgerAmountDto> expenseLedgerAmountDto)
        {
            _expenseLedgerBalanceDtos.AddRange(expenseLedgerAmountDto);
        }

        public List<LedgerAmountDto> GetIncomeLedgerDtosWithAmount() => _incomeLedgerBalanceDtos;
        public List<LedgerAmountDto> GetExpensesLedgerDtosWithAmount() => _expenseLedgerBalanceDtos;

        public decimal GetTotalIncomeBalance()
        {
            return _incomeLedgerBalanceDtos.Sum(s => s.Amount);
        }

        public decimal GetTotalExpensesBalance()
        {
            return _expenseLedgerBalanceDtos.Sum(s => s.Amount);
        }
    }
}
