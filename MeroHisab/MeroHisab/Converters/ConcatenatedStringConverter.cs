using System;
using System.Globalization;
using Xamarin.Forms;

namespace MeroHisab.Converters
{
    public class ConcatenatedStringConverter : IMultiValueConverter
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="values">
        ///  first param is string value to concatenate
        ///  second param is delimiter
        ///  third param is second value to concatenate
        /// </param>
        /// <param name="targetType"></param>
        /// <param name="parameter"></param>
        /// <param name="culture"></param>
        /// <returns></returns>
        public object Convert(object[] values, Type targetType, object parameter, CultureInfo culture)
        {
            if (values.Length < 2) return string.Empty;
            if (values[0] == null) return string.Empty;
            if (values[1] == null) return string.Empty;

            return $"{values[0]} {values[1]} {values[2]}";
        }

        public object[] ConvertBack(object value, Type[] targetTypes, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
