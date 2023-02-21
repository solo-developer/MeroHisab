using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;

namespace MeroHisab.Core.Makers.Interface
{
    public interface IReceiptMaker
    {
        void Copy(Receipt receipt, AddReceiptDto receipt_dto);
    }
}
