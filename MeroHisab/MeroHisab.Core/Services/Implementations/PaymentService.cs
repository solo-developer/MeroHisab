using System.Transactions;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Core.Repository.Interface;
using MeroHisab.Core.Dto;
using MeroHisab.Core.Exceptions;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Makers.Interface;
using System.Threading.Tasks;
using System;

namespace MeroHisab.Core.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentMaker paymentMaker;
        private readonly IPaymentRepository paymentRepo;
        private readonly ITransactionSummaryService transactionService;
        private readonly ITransactionDtoMaker _transactionDtoMaker;
        private readonly ILedgerSetupRepository _ledgerSetupRepo;

        public PaymentService(ITransactionDtoMaker transactionDtoMaker, ITransactionSummaryService _transactionService, IPaymentMaker _paymentMaker, IPaymentRepository _paymentRepo, ILedgerSetupRepository ledgerSetupRepo)
        {
            transactionService = _transactionService;
            paymentMaker = _paymentMaker;
            paymentRepo = _paymentRepo;
            _transactionDtoMaker = transactionDtoMaker;
            _ledgerSetupRepo = ledgerSetupRepo;
        }

        public async Task Cancel(int payment_id)
        {
            using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
            {
                var payment = await paymentRepo.Get(payment_id);
                if (payment == null)
                {
                    throw new ItemNotFoundException("Payment doesnot exists.");
                }
                if (payment.IsCancelled == true)
                {
                    throw new ItemUsedException("Payment is already cancelled.");
                }
                TransactionDto transactionDto = await getTransactionDtoForReverseEntry(payment);
                await transactionService.AddTransaction(transactionDto);

                payment.IsCancelled = true;
                payment.CancelledDate = DateTime.Now;
                await paymentRepo.Update(payment);
                tx.Complete();
            }


        }

        private async Task<TransactionDto> getTransactionDtoForReverseEntry(Payment payment)
        {
            TransactionDto transactionDto = new TransactionDto();
            transactionDto.TransactionDate = DateTime.Now;
            transactionDto.VoucherNo = payment.Id;
            transactionDto.VoucherType = Enums.VoucherType.Payment;
            transactionDto.Remarks = "Being Payment Cancelled";
            LedgerTransactionDto debitTransactionDetailDto = new LedgerTransactionDto();
            LedgerTransactionDto creditTransactionDetailDto = new LedgerTransactionDto();

            creditTransactionDetailDto.LedgerId = payment.PaymentTo;
            creditTransactionDetailDto.Amount = payment.Amount + payment.Discount;
            transactionDto.AddCreditData(creditTransactionDetailDto);

            debitTransactionDetailDto.LedgerId = payment.PaymentFrom;
            debitTransactionDetailDto.Amount = payment.Amount;
            transactionDto.AddDebitData(debitTransactionDetailDto);

            if (payment.Discount > 0)
            {
                LedgerTransactionDto crTransactionDetailDto = new LedgerTransactionDto();
                //check whether settings is available or not
                LedgerSetup discount_setting = await _ledgerSetupRepo.GetByKey(Enums.LedgerSetupType.discount_received.ToString());
                if (discount_setting == null)
                    throw new ItemNotFoundException("No setup found for discount received.");
                debitTransactionDetailDto.LedgerId = Convert.ToInt32(discount_setting.Value);
                debitTransactionDetailDto.Amount = payment.Discount;
                transactionDto.AddDebitData(debitTransactionDetailDto);
            }

            return transactionDto;
        }

        public async Task DoPayment(PaymentDto paymentDto)
        {
            try
            {
                using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
                {
                    if (!paymentDto.IsValid())
                        throw new InvalidValueException("The provided data are not valid.");
                    Payment payment = new Payment();
                    paymentMaker.Copy(payment, paymentDto);
                    await paymentRepo.Insert(payment);
                    paymentDto.PaymentFrom = payment.Id;
                    TransactionDto transactionDto = await _transactionDtoMaker.CreateTransactionDtoFrom(paymentDto);

                    await transactionService.AddTransaction(transactionDto);
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
