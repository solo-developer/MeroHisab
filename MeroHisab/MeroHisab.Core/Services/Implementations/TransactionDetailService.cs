﻿using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Makers.Interface;
using MeroHisab.Core.Repository.Interface;
using System.Transactions;

namespace MeroHisab.Core.Services.Implementations
{
    public class TransactionDetailService : ITransactionDetailService
    {
        private readonly ITransactionDetailRepository _transactionDetailRepo;
        private readonly ITransactionDetailDtoMaker _transactionDetailDtoAssembler;
        private readonly ILedgerRepository _ledgerRepo;

        public TransactionDetailService(ITransactionDetailRepository _transactionDetailRepo, ITransactionDetailDtoMaker transactionDetailDtoAssembler, ILedgerRepository ledgerRepo)
        {
            this._transactionDetailRepo = _transactionDetailRepo;
            _transactionDetailDtoAssembler = transactionDetailDtoAssembler;
            _ledgerRepo = ledgerRepo;

        }
        public Task<decimal> GetOldBalance(long ledger_id, DateTime last_date)
        {
            return _transactionDetailRepo.GetOldBalance(ledger_id, last_date);
        }

        public Task<decimal> GetEndBalance(long ledger_id)
        {
            return _transactionDetailRepo.GetEndBalance(ledger_id);
        }
        public async Task AddTransactionDetail(TransactionDetail transaction_detail)
        {
            try
            {
                using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
                {
                    decimal old_balance = 0;
                    if (transaction_detail.LedgerId > 0)
                    {
                        old_balance = await GetOldBalance(transaction_detail.LedgerId, transaction_detail.TransactionDate);
                    }

                    transaction_detail.Balance = old_balance + (transaction_detail.DrAmount - transaction_detail.CrAmount);


                    transaction_detail.Id = 0;
                    await _transactionDetailRepo.Insert(transaction_detail);

                    await UpdateBalanceIfBackdateEntryIsMade(transaction_detail.LedgerId, transaction_detail.TransactionDate, transaction_detail.Balance);
                    tx.Complete();

                }
            }
            catch (Exception)
            {
                throw;
            }

        }

        private async Task UpdateBalanceIfBackdateEntryIsMade(long ledger_id, DateTime transaction_date, decimal lastbalance)
        {
            if (ledger_id > 0)
            {
                var isBackDateEntryMade = await _transactionDetailRepo.IsBackDateEntryMade(ledger_id, transaction_date);
                if (isBackDateEntryMade == true)
                {
                    List<TransactionDetail> listOfRowsToBeUpdated = await _transactionDetailRepo.GetAllTransactionDetailOfLedgerLaterThanDate(ledger_id, transaction_date);
                    for (int a = 0; a < listOfRowsToBeUpdated.Count; a++)
                    {
                        listOfRowsToBeUpdated[a].Balance = lastbalance + (listOfRowsToBeUpdated[a].DrAmount - listOfRowsToBeUpdated[a].CrAmount);
                        lastbalance = listOfRowsToBeUpdated[a].Balance;
                    }
                    await _transactionDetailRepo.UpdateLedgerBalances(listOfRowsToBeUpdated);

                }
            }
        }

        public async Task AddTransactionDetail(TransactionDto transaction_dto)
        {
            using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
            {
                //var transaction = await _transactionRepo.Get(transaction_id) ?? throw new ItemNotFoundException($"Transaction with id {transaction_id} doesnot exist.");

                List<TransactionDetailDto> transactionDetailDtos = _transactionDetailDtoAssembler.GetTransactionDetails(transaction_dto);

                List<int> ledgerIdsUsedInTransaction = transactionDetailDtos.Select(a => a.LedgerId).Distinct().ToList();

                var ledgers = await _ledgerRepo.AsQueryable().Where(a => ledgerIdsUsedInTransaction.Contains(a.Id)).ToListAsync();

                foreach (var transactionDetailDto in transactionDetailDtos)
                {
                    TransactionDetail entity = new TransactionDetail();
                    //entity.TransactionId = transaction_id;
                    entity.TransactionDate = transactionDetailDto.TransactionDate;
                    entity.LedgerId = transactionDetailDto.LedgerId;
                    entity.RefLedgerId = transactionDetailDto.RefLedgerId;
                    entity.DrAmount = transactionDetailDto.DebitAmount;
                    entity.CrAmount = transactionDetailDto.CreditAmount;

                    await AddTransactionDetail(entity);
                }
                tx.Complete();
            }
        }
    }
}
