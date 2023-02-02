using MeroHisab.Core.Dto;
using MeroHisab.Core.Enums;
using MeroHisab.Core.Makers.Interface;
using MeroHisab.Core.Repository.Interface;
using MeroHisab.Core.Services.Interface;
using System;
using System.Transactions;

namespace MeroHisab.Core.Services.Implementations
{
    public class JournalService : IJournalService
    {
        private readonly ITransactionDtoMaker _transactionDtoMaker;
        private readonly ITransactionSummaryService _transactionService;

        public JournalService(ITransactionSummaryService transactionService, ITransactionDtoMaker transactionDtoMaker)
        {

            _transactionDtoMaker = transactionDtoMaker;
            _transactionService = transactionService;
        }

        public void makeJournalEntries(JournalDto journalDto)
        {

            try
            {
                using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
                {
                    var transactionDto = new TransactionDto();

                    foreach (var dto in journalDto.Details)
                    {
                        if (dto.DrAmount > 0)
                        {
                            transactionDto.AddDebitData(new LedgerTransactionDto()
                            {
                                Amount = dto.DrAmount,
                                LedgerId = dto.LedgerId
                            });
                        }

                        if (dto.CrAmount > 0)
                        {
                            transactionDto.AddCreditData(new LedgerTransactionDto()
                            {
                                Amount = dto.CrAmount,
                                LedgerId = dto.LedgerId,
                            });
                        }
                    }
                    transactionDto.Remarks = journalDto.Remarks;
                    transactionDto.VoucherNo = journalDto.VoucherNo;
                    transactionDto.VoucherType = VoucherType.Journal;
                    transactionDto.TransactionDate = journalDto.TransactionDate;
                    _transactionService.AddTransaction(transactionDto);
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
