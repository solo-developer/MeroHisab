﻿using MeroHisab.Core.Entities;
using MeroHisab.Core.Repository.Interface;
using MeroHisab.Core.Services.Interface;
using System.Transactions;

namespace MeroHisab.Core.Services.Implementations
{
    public class LedgerSetupService : ILedgerSetupService
    {
        private readonly ILedgerSetupRepository _ledgerSetupRepo;

        public LedgerSetupService(ILedgerSetupRepository ledgerSetupRepo)
        {
            _ledgerSetupRepo = ledgerSetupRepo;
        }

        public void saveOrUpdate(List<LedgerSetup> keyValue)
        {
            try
            {
                using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
                {
                    foreach (var kvp in keyValue)
                    {
                        saveOrUpdate(kvp.Key, kvp.Value);
                    }
                    tx.Complete();
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async void saveOrUpdate(string key, string value)
        {
            try
            {
                using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
                {
                    var ledgerSetup = await _ledgerSetupRepo.GetByKey(key);

                    if (ledgerSetup == null)
                    {
                        await save(key, value);
                    }
                    else
                    {
                        await update(ledgerSetup, value);
                    }
                    tx.Complete();
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        private async Task update(LedgerSetup ledgerSetup, string value)
        {
            ledgerSetup.Value = value;
            await _ledgerSetupRepo.Update(ledgerSetup);
        }

        private async Task save(string key, string value)
        {
            LedgerSetup ledgerSetup = new LedgerSetup();
            ledgerSetup.Key = key;
            ledgerSetup.Value = value;
            await _ledgerSetupRepo.Insert(ledgerSetup);
        }
    }
}