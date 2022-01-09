using MeroHisab.Core.Dto;

namespace MeroHisab.Core.Makers.Interface
{
    public interface ITransactionDtoMaker
    {
        Task<TransactionDto> CreateTransactionDtoFrom(LedgerDto ledgerDto);
        Task<TransactionDto> CreateTransactionDtoFrom(PaymentDto paymentDto);
        Task<TransactionDto> CreateTransactionDtoFrom(ReceiptDto receiptDto);
    }
}
