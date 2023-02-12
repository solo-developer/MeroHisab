using MeroHisab.Core.Dto;
using MeroHisab.Core.Enums;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using Xamarin.Forms;

namespace MeroHisab.Converters
{
    public class SelectedLedgerItemIndexConverter : IMultiValueConverter
    {
        //first parameter is ledger enum int value
        //second parameter is list of ledger dto
        public object Convert(object[] values, Type targetType, object parameter, CultureInfo culture)
        {
            if (values.Length < 2)
                return -1;
            if (values[0] == null) return -1;
            var ledgerKey = ((LedgerSetupType)values[0]).ToString();

            var ledgers = (ObservableCollection<LedgerSetupDto>)values[1];
            if (ledgers == null) return -1;

            var selectedLedger = ledgers.Where(a => a.Key == ledgerKey).FirstOrDefault();
            if (selectedLedger == null) return -1;

            return ledgers.IndexOf(selectedLedger);
        }

        public object[] ConvertBack(object value, Type[] targetTypes, object parameter, CultureInfo culture)
        {
            return new object[] { -1, new List<LedgerSetupDto>()};
        }
    }
}
