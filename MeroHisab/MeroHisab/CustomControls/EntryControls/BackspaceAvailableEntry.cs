using System;
using System.Collections.Generic;
using System.Text;
using Xamarin.Forms;

namespace XmartCreditMobileApp.CustomControls.EntryControls
{
    public class BackspaceAvailableEntry : Entry
    {
        public delegate void BackspaceEventHandler(object sender, EventArgs e);

        public event BackspaceEventHandler OnBackspace;

        public BackspaceAvailableEntry() { }

        public void OnBackspacePressed()
        {
            if (OnBackspace != null)
            {
                OnBackspace(null, null);
            }

        }
    }
}
