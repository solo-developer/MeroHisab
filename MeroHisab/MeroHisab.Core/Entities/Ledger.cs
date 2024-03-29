﻿using MeroHisab.Core.Enums;
using MeroHisab.Core.Exceptions;
using System;

namespace MeroHisab.Core.Entities
{
    public class Ledger :BaseEntity
    {
        private string _name;

        public string Name
        {
            get => _name;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new NonEmptyValueException("Ledger name cannot be empty.");
                _name = value;
            }
        }

        public LedgerGroupType Type { get; set; }
        public LedgerType LedgerType { get; set; }
        public string Code { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        public bool IsEnabled { get; set; } = true;

        public void Enable() => IsEnabled = true;
        public void Disable() => IsEnabled = false;

    }
}
