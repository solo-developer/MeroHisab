using System;
using System.Collections.Generic;
using System.Text;

namespace MeroHisab.Core.Dto
{
    public class BalanceSheetDto
    {
        private List<LedgerAmountDto> _assetsLedgerDtos { get; set; } = new List<LedgerAmountDto>();
        private List<LedgerAmountDto> _liabilitiesLedgerDtos { get; set; } = new List<LedgerAmountDto>();

        public decimal ProfitAndLossAmount { get; set; }
        public  decimal ClosingBalance { get; set; }
        public string StartDate { get; set; } 
        public string EndDate { get; set; } 


        public void AddAssetsLedgerAmountDto(List<LedgerAmountDto> assetLedgerDto)
        {
            _assetsLedgerDtos.AddRange(assetLedgerDto);
        }

        public void AddLiabilitiesLedgerAmountDto(List<LedgerAmountDto> liabilitesLedgerDto)
        {
            _liabilitiesLedgerDtos.AddRange(liabilitesLedgerDto);
        }

        public List<LedgerAmountDto> GetLiabilitiesLedgerAmountDtos() => _liabilitiesLedgerDtos;

        public List<LedgerAmountDto> GetAssetsLedgerAmountDtos() => _assetsLedgerDtos;
    }
}
