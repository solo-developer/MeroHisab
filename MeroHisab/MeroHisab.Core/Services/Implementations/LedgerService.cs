using MeroHisab.Core.BaseRepository.Interface;
using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Services.Interface;

namespace MeroHisab.Core.Services.Implementations
{
    public class LedgerService : ILedgerService
    {
        private readonly IBaseRepository<Ledger> _ledgerRepo;
        public LedgerService(IBaseRepository<Ledger> ledgerRepo)
        {
            _ledgerRepo = ledgerRepo;
        }
        public async Task<List<LedgerDto>> GetAllLedgersAsync()
        {
            var accountHeads = await _ledgerRepo.Get<Ledger>(a => a.IsEnabled);

            return accountHeads.Select(a => new LedgerDto
            {
                LedgerId = a.Id,
                Name = a.Name,
                Type = a.Type,
                Code = a.Code
            }).ToList();
        }
    }
}
