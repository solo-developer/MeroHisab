using MeroHisab.Core.Dto;

namespace MeroHisab.Core.Makers.Interface
{
    public interface ITransactionDetailDtoMaker
    {
        List<TransactionDetailDto> GetTransactionDetails(TransactionDto transaction_dto);
    }
}
