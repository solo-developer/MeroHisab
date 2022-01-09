using LE.Account.Service.Services.Interface;
using MeroHisab.Core.Dto;
using MeroHisab.Core.Exceptions;
using MeroHisab.Core.Makers.Interface;
using MeroHisab.Core.Repository.Interface;
using System.Transactions;

namespace LE.Account.Service.Services.Implementations
{
    public class TransactionSummaryService : ITransactionSummaryService
    {
        private readonly ITransactionMaker _transactionMaker;
        private readonly ITransactionRepository transactionRepo;
        private readonly ITransactionDetailService transactionDetailService;

        public TransactionSummaryService(ITransactionMaker transactionMaker, ITransactionRepository _transactionRepo, ITransactionDetailService _transactionDetailService)
        {
            transactionRepo = _transactionRepo;
            transactionDetailService = _transactionDetailService;
            _transactionMaker = transactionMaker;
        }
        public async Task AddTransaction(TransactionDto transactionDto)
        {
            try
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
                    int tran_id = transactionEntity.Id;

                    await transactionRepo.Insert(transactionEntity);

                    await transactionDetailService.AddTransactionDetail(transactionDto, tran_id);
                    tx.Complete();
                }
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
