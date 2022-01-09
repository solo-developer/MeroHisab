namespace MeroHisab.Core.Dto
{
    public class TrialBalanceDto
    {

        private List<LedgerAmountDto> _assetsLedgerBalanceDtos { get; set; } = new List<LedgerAmountDto>();
        private List<LedgerAmountDto> _liabilityLedgerBalanceDtos { get; set; } = new List<LedgerAmountDto>();
        private List<LedgerAmountDto> _incomeLedgerBalanceDtos { get; set; } = new List<LedgerAmountDto>();
        private List<LedgerAmountDto> _expensesLedgerBalanceDtos { get; set; } = new List<LedgerAmountDto>();


        public decimal OpeningBalance { get; set; }
        public string StartDate { get; set; }

        public string EndDate { get; set; }

        public void AddAssetsLedgerBalanceDto(List<LedgerAmountDto> assetsLedgerAmountDto)
        {
            _assetsLedgerBalanceDtos.AddRange(assetsLedgerAmountDto);
        }

        public void AddLiabilityLedgerBalanceDto(List<LedgerAmountDto> liabilyLedgerAmountDto)
        {
            _liabilityLedgerBalanceDtos.AddRange(liabilyLedgerAmountDto);
        }

        public void AddIncomeLedgerBalanceDto(List<LedgerAmountDto> incomeLedgerAmountDto)
        {
            _incomeLedgerBalanceDtos.AddRange(incomeLedgerAmountDto);
        }

        public void AddExpensesLedgerBalanceDto(List<LedgerAmountDto> expensesLedgerAmountDto)
        {
            _expensesLedgerBalanceDtos.AddRange(expensesLedgerAmountDto);
        }

        public List<LedgerAmountDto> GetAssetsLedgerDtoWithBalance() => _assetsLedgerBalanceDtos;
        public List<LedgerAmountDto> GetLiabilitiesLedgerDtoWithBalance() => _liabilityLedgerBalanceDtos;
        public List<LedgerAmountDto> GetIncomeLedgerDtoWithBalance() => _incomeLedgerBalanceDtos;
        public List<LedgerAmountDto> GetExpensesLedgerDtoWithBalance() => _expensesLedgerBalanceDtos;

    }
}
