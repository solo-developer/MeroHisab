﻿using System;
using System.Globalization;
using Xamarin.Forms;

namespace XmartCreditMobileApp.Converters
{
    public class IsNegatedValueConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null)
                return false;
            if (targetType != typeof(bool))
                return false;

            return !(bool)value;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}
