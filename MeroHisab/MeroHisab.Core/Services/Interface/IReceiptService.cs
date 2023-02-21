using MeroHisab.Core.Dto;
using MeroHisab.Core.Dto.Report;
using System.Threading.Tasks;

namespace MeroHisab.Core.Services.Interface
{
    public interface IReceiptService
    {
        Task<int> MakeReceipt(AddReceiptDto receiptDto);
        Task Cancel(int receipt_id);

        Task<List<ReceiptDto>> Get(DateTime fromDate, DateTime toDate);
    }
}
