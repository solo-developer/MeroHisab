using MeroHisab.Core.Dto;

namespace MeroHisab.Core.Services.Interface
{
    public interface ILedgerService
    {
        Task<List<LedgerDto>> GetAllLedgersAsync();
    }
}
