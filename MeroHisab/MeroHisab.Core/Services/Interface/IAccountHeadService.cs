using MeroHisab.Core.Dto;

namespace MeroHisab.Core.Services.Interface
{
    public interface IAccountHeadService
    {
        Task<List<AccountHeadDto>> GetAccountHeads(int? take = null);

        Task Save(AccountHeadDto accountHead);
    }
}
