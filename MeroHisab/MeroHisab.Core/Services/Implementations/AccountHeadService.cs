using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Repository.Interface;
using MeroHisab.Core.Services.Interface;
using System;
using System.Collections.Generic;
using System.Text;

namespace MeroHisab.Core.Services.Implementations
{
    public class AccountHeadService : IAccountHeadService
    {
        private readonly IBaseRepository<AccountHead> _repo;
        public AccountHeadService(IBaseRepository<AccountHead> repo)
        {
            _repo = repo;
        }

        public async Task<List<AccountHeadDto>> GetAccountHeads(int? take = null)
        {
            var accountHeads = new List<AccountHead>();
            if (take.HasValue)
            {
                accountHeads = await _repo.Get<AccountHead>(a => a.IsEnabled);
            }
            return accountHeads.Select(a => new AccountHeadDto
            {
                Id = a.Id,
                Name = a.Name,
                HeadType = a.HeadType,
            }).ToList();
        }

        public Task Save(AccountHeadDto accountHead)
        {
            throw new NotImplementedException();
        }
    }
}
