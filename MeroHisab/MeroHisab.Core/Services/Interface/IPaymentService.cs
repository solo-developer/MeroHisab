using MeroHisab.Core.Dto;
using MeroHisab.Core.Dto.Report;
using System.Threading.Tasks;

namespace MeroHisab.Core.Services.Interface
{
    public interface IPaymentService
    {
        Task DoPayment(AddPaymentDto paymentDto);
        Task Cancel(int payment_id);
        Task<List<PaymentDto>> Get(DateTime fromDate, DateTime toDate);
    }
}
