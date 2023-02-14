using MeroHisab.Core.BaseRepository.Interface;
using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Enums;
using MeroHisab.Core.Exceptions;
using MeroHisab.Core.Services.Interface;

namespace MeroHisab.Core.Services.Implementations
{
    public class AccountHeadService : IAccountHeadService
    {
        private readonly IBaseRepository<Ledger> _repo;
        public AccountHeadService(IBaseRepository<Ledger> repo)
        {
            _repo = repo;
        }

        public async Task Disable(int id)
        {
            var entity = (await _repo.Get(id)) ?? throw new ItemNotFoundException("Account head not found.");
            entity.Disable();
            await _repo.Update(entity);
        }

        public async Task<List<AccountHeadDto>> GetAccountHeads(LedgerType ledgerType, int? take = null)
        {
            var accountHeads = await _repo.Get<Ledger>(a => a.IsEnabled && a.LedgerType == ledgerType);
            if (take.HasValue)
            {
                accountHeads = accountHeads.Take(take.Value).ToList();
            }
            return accountHeads.Select(a => new AccountHeadDto
            {
                Id = a.Id,
                Name = a.Name,
                HeadType = a.Type,
                Code = a.Code,
                LedgerType = a.LedgerType,
            }).ToList();
        }

		public async Task<List<AccountHeadDto>> GetAllAcountHead()
		{
            var accountHeads = await _repo.Get<Ledger>(a => a.IsEnabled && a.LedgerType!=LedgerType.PaymentMedium);
            return accountHeads.Select(a => new AccountHeadDto {
                Id = a.Id,
                Name = a.Name,
                HeadType = a.Type,
                Code = a.Code,
                LedgerType = a.LedgerType,
            }).ToList();
		}

		public async Task SaveOrUpdate(AccountHeadDto accountHead)
        {
            var entity = (await _repo.Get(accountHead.Id)) ?? new Ledger();
            entity.Name = accountHead.Name;
            entity.Type = accountHead.HeadType;
            entity.LedgerType = accountHead.LedgerType;
            entity.Code = accountHead.Code;

            if (accountHead.Id == 0)
                await _repo.Insert(entity);
            else
                await _repo.Update(entity);
        }
    }
}
