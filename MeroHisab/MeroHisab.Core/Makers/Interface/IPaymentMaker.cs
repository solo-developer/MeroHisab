using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;

namespace MeroHisab.Core.Makers.Interface
{
    public interface IPaymentMaker
    {
        void Copy(Payment payment, PaymentDto payment_dto);
    }
}
