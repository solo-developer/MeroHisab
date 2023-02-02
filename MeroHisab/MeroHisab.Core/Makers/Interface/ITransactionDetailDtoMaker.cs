using MeroHisab.Core.Dto;
using System.Collections.Generic;

namespace MeroHisab.Core.Makers.Interface
{
    public interface ITransactionDetailDtoMaker
    {
        List<TransactionDetailDto> GetTransactionDetails(TransactionDto transaction_dto);
    }
}
