using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using Xamarin.Forms;

namespace MeroHisab.Converters
{
    public class AmountPrefixedByCurrencyConverter : IValueConverter
    {
        private static string Currency = "NPR";
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null)
                return $"{Currency} 0";
            if (targetType != typeof(decimal))
                return $"{Currency} 0";

            return $"{Currency} {value}";
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
