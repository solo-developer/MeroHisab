﻿namespace MeroHisab.Core.Dto
{
    public class PaymentMediumDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public decimal Balance { get; set; }
    }
}
