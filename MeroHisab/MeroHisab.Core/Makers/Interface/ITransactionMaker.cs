﻿using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;
using System.Threading.Tasks;

namespace MeroHisab.Core.Makers.Interface
{
    public interface ITransactionMaker
    {
        Task Copy(TransactionSummary transaction, TransactionDto transaction_dto);
    }
}