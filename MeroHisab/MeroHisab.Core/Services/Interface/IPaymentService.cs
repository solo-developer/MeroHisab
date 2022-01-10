using MeroHisab.Core.Dto;

namespace MeroHisab.Core.Services.Interface
{
    public interface IPaymentService
    {
        Task DoPayment(PaymentDto paymentDto);
        Task Cancel(int payment_id);

    }
}
