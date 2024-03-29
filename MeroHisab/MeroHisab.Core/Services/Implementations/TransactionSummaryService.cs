﻿using MeroHisab.Core.Dto;
using MeroHisab.Core.Exceptions;
using MeroHisab.Core.Makers.Interface;
using MeroHisab.Core.Repository.Interface;
using System.Transactions;

namespace MeroHisab.Core.Services.Implementations
{
    public class TransactionSummaryService : ITransactionSummaryService
    {
        private readonly ITransactionMaker _transactionMaker;
        private readonly ITransactionRepository _transactionRepo;
        private readonly ITransactionDetailService _transactionDetailService;

        public TransactionSummaryService(ITransactionMaker transactionMaker, ITransactionRepository _transactionRepo, ITransactionDetailService _transactionDetailService)
        {
            this._transactionRepo = _transactionRepo;
            this._transactionDetailService = _transactionDetailService;
            _transactionMaker = transactionMaker;
        }
        public async Task AddTransaction(TransactionDto transactionDto)
        {
            using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
            {
                if (!transactionDto.IsTransactionPerformedValid())
                    throw new InvalidValueException("More than Two transaction data cannot be in either debit or credit side.");
                if (!transactionDto.IsTransactionAmountValid())
                    throw new InvalidValueException("Amount cannot be negative and must be equal.");

                if (!transactionDto.IsTransactionDateValid())
                {
                    throw new InvalidValueException("You are not allowed to perform transaction in upcoming days.");
                }

                MeroHisab.Core.Entities.TransactionSummary transactionEntity = new MeroHisab.Core.Entities.TransactionSummary();
                await _transactionMaker.Copy(transactionEntity, transactionDto);

                transactionEntity.Amount = transactionDto.GetTransactionAmount();
                transactionEntity.Remarks = transactionDto.Remarks;

                await _transactionRepo.Insert(transactionEntity);

                await _transactionDetailService.AddTransactionDetail(transactionDto);
                tx.Complete();
            }
        }
    }
}
