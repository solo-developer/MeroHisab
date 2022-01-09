using MeroHisab.Core.Makers.Interface;
using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;

namespace MeroHisab.Core.Makers.Implementations
{
    public class PaymentMaker:IPaymentMaker
    {
        public void Copy(Payment payment,PaymentDto payment_dto)
        {
            payment.TransactionDate = payment_dto.TransactionDate;
            payment.Remarks = payment_dto.Remarks;
            payment.PaymentFrom = payment_dto.PaymentFrom;
            payment.PaymentTo = payment_dto.PaymentTo;
            payment.Amount = payment_dto.Amount;
            payment.Discount = payment_dto.Discount;
        }
    }
}
