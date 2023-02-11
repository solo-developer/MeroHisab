using MeroHisab.Core.Dto;
using MeroHisab.Core.Enums;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.Linq;
using System.Text;
using Xamarin.Forms;

namespace MeroHisab.Converters
{
    public class LedgerFilterByGroupConverter : IMultiValueConverter
    {

        //first parameter is LedgerGroupTypeEnum
        //second parameter is list of ledger dto
        public object Convert(object[] values, Type targetType, object parameter, CultureInfo culture)
        {
            if (values.Length < 2)
                return new List<LedgerDto>();
            if (values[0] == null) return new List<LedgerDto>();
            var group = (LedgerGroupType)values[0];

            var ledgers=(ObservableCollection<LedgerDto>) values[1];
            if(ledgers==null) return new List<LedgerDto>();

           
            return ledgers.Where(a => a.Type == group).ToList();
        }

        public object[] ConvertBack(object value, Type[] targetTypes, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
