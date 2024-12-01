import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

const ConfirmFinalizarDialog = ({ open, onClose, onConfirm }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-fin-dialog"
            aria-describedby="confirm-fin-dialog-description"
        >
            <DialogTitle id="confirm-fin-dialog">¿Estás seguro de que quieres finalizar el hito?</DialogTitle>
            <DialogContent>
                <p>El hito ya no estará disponible hasta que se vuelva a asignar.</p>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancelar
                </Button>
                <Button
                    onClick={() => {
                        onConfirm(); // Ejecuta la acción de confirmación
                        onClose(); // Cierra el diálogo
                    }}
                    color="secondary"
                    autoFocus
                >
                    Finalizar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmFinalizarDialog;
