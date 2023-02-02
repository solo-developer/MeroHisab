using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Enums;
using MeroHisab.Core.Exceptions;
using MeroHisab.Core.Makers.Interface;
using MeroHisab.Core.Repository.Interface;
using System;
using System.Threading.Tasks;

namespace MeroHisab.Core.Makers.Implementations
{
    public class TransactionDtoMaker : ITransactionDtoMaker
    {
        private ILedgerSetupRepository ledgerSetupRepo;

        public TransactionDtoMaker(ILedgerSetupRepository _ledgerSetupRepo)
        {
            ledgerSetupRepo = _ledgerSetupRepo;
        }

        public async Task<TransactionDto> CreateTransactionDtoFrom(LedgerDto ledgerDto)
        {
            TransactionDto transactionDto = new TransactionDto();
            LedgerTransactionDto debitTransactionDetailDto = new LedgerTransactionDto();
            LedgerTransactionDto creditTransactionDetailDto = new LedgerTransactionDto();

            switch (ledgerDto.BalanceType)
            {
                case OpeningBalanceType.debit:
                    debitTransactionDetailDto.LedgerId = ledgerDto.LedgerId;
                    debitTransactionDetailDto.Amount = ledgerDto.OpeningBalance;

                    creditTransactionDetailDto.LedgerId = 0;
                    creditTransactionDetailDto.Amount = ledgerDto.OpeningBalance;
                    break;

                case Enums.OpeningBalanceType.credit:
                    creditTransactionDetailDto.LedgerId = ledgerDto.LedgerId;
                    creditTransactionDetailDto.Amount = ledgerDto.OpeningBalance;

                    debitTransactionDetailDto.LedgerId = 0;
                    debitTransactionDetailDto.Amount = ledgerDto.OpeningBalance;

                    break;
                default:
                    throw new InvalidValueException("Opening Balance Type is not specified.");

            }
            transactionDto.AddCreditData(creditTransactionDetailDto);
            transactionDto.AddDebitData(debitTransactionDetailDto);
            transactionDto.Remarks = "Being ledger created for ledger " + ledgerDto.Name;
            transactionDto.TransactionDate = DateTime.Now;
            return transactionDto;

        }

        public async Task<TransactionDto> CreateTransactionDtoFrom(PaymentDto paymentDto)
        {
            TransactionDto transactionDto = new TransactionDto();
            transactionDto.TransactionDate = paymentDto.TransactionDate;
            transactionDto.Remarks = paymentDto.Remarks;
            transactionDto.VoucherNo = paymentDto.PaymentId;
            transactionDto.VoucherType = VoucherType.Payment;

            LedgerTransactionDto debitTransactionDetailDto = new LedgerTransactionDto();
            LedgerTransactionDto creditTransactionDetailDto = new LedgerTransactionDto();

            debitTransactionDetailDto.LedgerId = paymentDto.PaymentTo;
            debitTransactionDetailDto.Amount = paymentDto.Amount + paymentDto.Discount;
            transactionDto.AddDebitData(debitTransactionDetailDto);

            creditTransactionDetailDto.LedgerId = paymentDto.PaymentFrom;
            creditTransactionDetailDto.Amount = paymentDto.Amount;
            transactionDto.AddCreditData(creditTransactionDetailDto);

            if (paymentDto.Discount > 0)
            {
                LedgerTransactionDto crTransactionDetailDto = new LedgerTransactionDto();
                //check whether settings is available or not
                LedgerSetup discount_setting = await ledgerSetupRepo.GetByKey(Enums.LedgerSetupType.discount_received.ToString());
                if (discount_setting == null)
                    throw new ItemNotFoundException("No setup found for discount received.");
                crTransactionDetailDto.LedgerId = Convert.ToInt32(discount_setting.Value);
                crTransactionDetailDto.Amount = paymentDto.Discount;
                transactionDto.AddCreditData(crTransactionDetailDto);
            }

            return transactionDto;
        }

        public async Task<TransactionDto> CreateTransactionDtoFrom(ReceiptDto receiptDto)
        {
            TransactionDto transactionDto = new TransactionDto();
            transactionDto.TransactionDate = receiptDto.TransactionDate;
            transactionDto.Remarks = receiptDto.Remarks;
            transactionDto.VoucherNo = receiptDto.ReceiptId;
            transactionDto.VoucherType = VoucherType.Receipt;
            LedgerTransactionDto debitTransactionDetailDto = new LedgerTransactionDto();
            LedgerTransactionDto creditTransactionDetailDto = new LedgerTransactionDto();

            debitTransactionDetailDto.LedgerId = receiptDto.ReceiptTo;
            debitTransactionDetailDto.Amount = receiptDto.Amount + receiptDto.Discount;
            transactionDto.AddDebitData(debitTransactionDetailDto);

            creditTransactionDetailDto.LedgerId = receiptDto.ReceiptFrom;
            creditTransactionDetailDto.Amount = receiptDto.Amount;
            transactionDto.AddCreditData(creditTransactionDetailDto);

            if (receiptDto.Discount > 0)
            {
                TransactionDetailDto crTransactionDetailDto = new TransactionDetailDto();
                //check whether settings is available or not
                LedgerSetup discount_setting = await ledgerSetupRepo.GetByKey(Enums.LedgerSetupType.discount_allowed.ToString());
                if (discount_setting == null)
                    throw new ItemNotFoundException("No setup found for discount allowed.");
                creditTransactionDetailDto.LedgerId = Convert.ToInt32(discount_setting.Value);
                creditTransactionDetailDto.Amount = receiptDto.Discount;
                transactionDto.AddCreditData(creditTransactionDetailDto);
            }
            return transactionDto;
        }
    }
}
