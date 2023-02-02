using MeroHisab.Core.Dto;
using System.Threading.Tasks;

namespace MeroHisab.Core.Services.Interface
{
    public interface IReceiptService
    {
        Task<int> MakeReceipt(ReceiptDto receiptDto);
        Task Cancel(int receipt_id);
    }
}
