using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;

namespace MeroHisab.Core.Makers.Interface
{
    public interface IPaymentMaker
    {
        void Copy(Payment payment, AddPaymentDto payment_dto);
    }
}
