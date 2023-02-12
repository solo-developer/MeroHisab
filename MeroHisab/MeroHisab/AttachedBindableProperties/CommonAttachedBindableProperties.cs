using System;
using System.Collections.Generic;
using System.Text;
using Xamarin.Forms;

namespace MeroHisab.AttachedBindableProperties
{
    public class CommonAttachedBindableProperties
    {
        public static readonly BindableProperty IdProperty =
       BindableProperty.CreateAttached("Id", typeof(int), typeof(CommonAttachedBindableProperties), defaultValue: 0);

        public static int GetId(BindableObject view)
        {
            return (int)view.GetValue(IdProperty);
        }

        public static void SetId(BindableObject view, int value)
        {
            view.SetValue(IdProperty, value);
        }
    }
}
