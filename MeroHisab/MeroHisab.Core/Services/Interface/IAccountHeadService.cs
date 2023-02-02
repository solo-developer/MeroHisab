using MeroHisab.Core.Dto;
using MeroHisab.Core.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MeroHisab.Core.Services.Interface
{
    public interface IAccountHeadService
    {
        Task<List<AccountHeadDto>> GetAllAcountHead();
        Task<List<AccountHeadDto>> GetAccountHeads(LedgerType ledgerType, int? take = null);

        Task SaveOrUpdate(AccountHeadDto accountHead);

        Task Disable(int id);
    }
}
