using System.Transactions;
using MeroHisab.Core.Services.Interface;
using MeroHisab.Core.Repository.Interface;
using MeroHisab.Core.Dto;
using MeroHisab.Core.Exceptions;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Makers.Interface;

namespace MeroHisab.Core.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentMaker _paymentMaker;
        private readonly IPaymentRepository _paymentRepo;
        private readonly ITransactionSummaryService _transactionService;
        private readonly ITransactionDtoMaker _transactionDtoMaker;
        private readonly ILedgerSetupRepository _ledgerSetupRepo;

        public PaymentService(ITransactionDtoMaker transactionDtoMaker, ITransactionSummaryService _transactionService, IPaymentMaker _paymentMaker, IPaymentRepository _paymentRepo, ILedgerSetupRepository ledgerSetupRepo)
        {
            this._transactionService = _transactionService;
            this._paymentMaker = _paymentMaker;
            this._paymentRepo = _paymentRepo;
            _transactionDtoMaker = transactionDtoMaker;
            _ledgerSetupRepo = ledgerSetupRepo;
        }

        public async Task Cancel(int payment_id)
        {
            using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
            {
                var payment = await _paymentRepo.Get(payment_id);
                if (payment == null)
                {
                    throw new ItemNotFoundException("Payment doesnot exists.");
                }
                if (payment.IsCancelled == true)
                {
                    throw new ItemUsedException("Payment is already cancelled.");
                }
                TransactionDto transactionDto = await getTransactionDtoForReverseEntry(payment);
                await _transactionService.AddTransaction(transactionDto);

                payment.IsCancelled = true;
                payment.CancelledDate = DateTime.Now;
                await _paymentRepo.Update(payment);
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
            using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
            {
                if (!paymentDto.IsValid())
                    throw new InvalidValueException("The provided data are not valid.");
                Payment payment = new Payment();
                _paymentMaker.Copy(payment, paymentDto);
                await _paymentRepo.Insert(payment);
                paymentDto.PaymentFrom = payment.Id;
                TransactionDto transactionDto = await _transactionDtoMaker.CreateTransactionDtoFrom(paymentDto);

                await _transactionService.AddTransaction(transactionDto);
                tx.Complete();
            }
        }
    }
}
