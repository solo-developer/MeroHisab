using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;

namespace MeroHisab.Core.Makers.Interface
{
    public interface IReceiptMaker
    {
        void Copy(Receipt receipt, ReceiptDto receipt_dto);
    }
}
