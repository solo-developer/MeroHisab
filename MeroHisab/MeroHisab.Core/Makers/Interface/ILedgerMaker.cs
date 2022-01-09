using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;

namespace MeroHisab.Core.Makers.Interface
{
    public interface ILedgerMaker
    {
        void Copy(Ledger ledger, LedgerDto ledger_dto);
    }
}
