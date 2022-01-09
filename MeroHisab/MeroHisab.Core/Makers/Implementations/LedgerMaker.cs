using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Makers.Interface;

namespace MeroHisab.Core.Makers.Implementations
{
    public class LedgerMaker: ILedgerMaker
    {
        public void Copy(Ledger ledger, LedgerDto ledger_dto)
        {
            ledger.Id = ledger_dto.LedgerId;
            ledger.Name = ledger_dto.Name;
            ledger.CreatedDate = ledger_dto.CreatedDate;
            ledger.Type = ledger_dto.Type;
            ledger.Code = ledger_dto.Code;
        }
    }
}
