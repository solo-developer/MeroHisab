using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Enums;
using MeroHisab.Core.Exceptions;
using MeroHisab.Core.Makers.Interface;
using MeroHisab.Core.Repository.Interface;
using MeroHisab.Core.Services.Interface;
using System.Transactions;

namespace MeroHisab.Core.Services.Implementations
{
    public class ReceiptService : IReceiptService
    {
        private readonly IReceiptRepository _receiptRepo;
        private readonly ITransactionSummaryService _transactionService;
        private readonly IReceiptMaker _receiptMaker;
        private readonly ITransactionDtoMaker _transactionDtoMaker;
        private readonly ILedgerSetupRepository _ledgerSetupRepo;

        public ReceiptService(ITransactionDtoMaker transactionDtoMaker, IReceiptMaker receiptMaker, IReceiptRepository receiptRepo, ITransactionSummaryService transactionService, ILedgerSetupRepository ledgerSetupRepo)
        {
            _receiptRepo = receiptRepo;
            _transactionService = transactionService;
            _receiptMaker = receiptMaker;
            _transactionDtoMaker = transactionDtoMaker;
            _ledgerSetupRepo = ledgerSetupRepo;
        }

        public async Task Cancel(int receipt_id)
        {
            using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
            {
                var receipt = await _receiptRepo.Get(receipt_id);
                if (receipt == null)
                {
                    throw new ItemNotFoundException("Receipt doesnot exist.");
                }
                if (receipt.IsCancelled == true)
                {
                    throw new ItemUsedException("Receipt is already cancelled.");
                }

                TransactionDto transactionDto = await GetTransactionDtoForReverseEntry(receipt);
                await _transactionService.AddTransaction(transactionDto);

                receipt.IsCancelled = true;
                receipt.CancelledDate = DateTime.Now;
                await _receiptRepo.Update(receipt);
                tx.Complete();
            }

        }

        private async Task<TransactionDto> GetTransactionDtoForReverseEntry(Receipt receipt)
        {
            TransactionDto transactionDto = new TransactionDto();
            transactionDto.TransactionDate = DateTime.Now;
            transactionDto.VoucherNo = receipt.Id;
            transactionDto.VoucherType = VoucherType.Receipt;
            transactionDto.Remarks = "Being Receipt Cancelled";
            LedgerTransactionDto debitTransactionDetailDto = new LedgerTransactionDto();
            LedgerTransactionDto creditTransactionDetailDto = new LedgerTransactionDto();

            creditTransactionDetailDto.LedgerId = receipt.ReceiptTo;
            creditTransactionDetailDto.Amount = receipt.Amount + receipt.Discount;
            transactionDto.AddCreditData(creditTransactionDetailDto);

            debitTransactionDetailDto.LedgerId = receipt.ReceiptFrom;
            debitTransactionDetailDto.Amount = receipt.Amount;
            transactionDto.AddDebitData(debitTransactionDetailDto);

            if (receipt.Discount > 0)
            {
                TransactionDetailDto crTransactionDetailDto = new TransactionDetailDto();
                //check whether settings is available or not
                LedgerSetup discount_setting = await _ledgerSetupRepo.GetByKey(Enums.LedgerSetupType.discount_allowed.ToString());
                if (discount_setting == null)
                    throw new ItemNotFoundException("No setup found for discount allowed.");
                debitTransactionDetailDto.LedgerId = Convert.ToInt32(discount_setting.Value);
                debitTransactionDetailDto.Amount = receipt.Discount;
                transactionDto.AddDebitData(debitTransactionDetailDto);
            }

            return transactionDto;
        }

        public async Task<int> MakeReceipt(ReceiptDto receiptDto)
        {
            using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
            {
                if (!receiptDto.IsValid())
                    throw new InvalidValueException("The provided data are not valid.");
                Receipt receipt = new Receipt();
                _receiptMaker.Copy(receipt, receiptDto);
                await _receiptRepo.Insert(receipt);
                receiptDto.ReceiptId = receipt.Id;
                TransactionDto transactionDto = await _transactionDtoMaker.CreateTransactionDtoFrom(receiptDto);

                await _transactionService.AddTransaction(transactionDto);
                tx.Complete();
                return receipt.Id;
            }
        }

    }
}
